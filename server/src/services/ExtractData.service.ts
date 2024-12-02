import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Plan } from 'src/entities/plan.entity';

import { TeamService } from './Team.service';
import * as ExcelJS from 'exceljs';
import { targetModulesByContainer } from '@nestjs/core/router/router-module';
import { User } from 'src/entities/user.entity';
import { DailyWork } from 'src/entities/DailyWork.entity';
@Injectable()
export class ExtractDataService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DailyWork)
    private readonly dailyWorkRepository: Repository<DailyWork>,
    private teamService: TeamService,
  ) {}

  async ExtractPlan(
    res,
    idRespo: number,
    teamId: number,
    start: string,
    end: string,
  ) {
    let teamIds: number[] = [];

    if (teamId == -1) {
      const teams = await this.teamService.findTeamByRespo(idRespo);

      teamIds = teams.map((team) => team.id);
      teamIds = await this.teamService.getAllTeamIdsWithChildren(teamIds);
    } else {
      // Get all team IDs including the children teams
      teamIds = await this.teamService.getAllTeamIdsWithChildren([teamId]);
    }

    try {
      // Fetch all collaborators (collabs) for the selected teams
      const collabs = await this.userRepository.find({
        where: {
          team: { id: In(teamIds) }, // Filter collabs by team IDs
        },
        select: ['id', 'name', 'lastName', 'mat'], // Select collab details
      });

      // Fetch plans for the selected teams and date range
      const plans = await this.planRepository.find({
        where: {
          collab: {
            team: { id: In(teamIds) }, // Filter plans by team IDs
          },
          date: Between(start, end), // Filter by date range
          isProposal: false, // Ensure it's not a proposal
        },
        select: ['date', 'collab', 'team'], // Select relevant fields (date, collab, team)
        relations: ['collab', 'team'],
      });

      // Create a map of plans grouped by collab ID
      const plansByCollabId = new Map<number, any[]>();
      plans.forEach((plan) => {
        const collabId = plan.collab.id;
        if (!plansByCollabId.has(collabId)) {
          plansByCollabId.set(collabId, []);
        }
        plansByCollabId.get(collabId).push(plan);
      });

      // For each collab, find their corresponding plans (if any)
      const combinedData = collabs.map((collab) => {
        return {
          ...collab,
          plans: plansByCollabId.get(collab.id) || [], // Get plans for the collab, or empty if none
        };
      });

      // Generate Excel file using the combined collab and plan data
      await this.generateExcel(res, combinedData, start, end); // Assuming you have this function
    } catch (error) {
      console.error('Error fetching team plans:', error);
      throw new Error('Failed to export team plans.');
    }
  }

  async generateExcel(res, plans: any[], start: string, end: string) {
    // Parse and validate the start and end dates
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Validate that the start and end dates are in the correct order
    if (startDate > endDate) {
      throw new Error('Start date cannot be greater than the end date.');
    }

    // Calculate the date range between start and end dates
    const planDates: string[] = [];
    const planDates2: string[] = [];
    const dayNames: string[] = [];
    const dayTypes: number[] = [];

    let tempDate = new Date(startDate);
    while (tempDate <= endDate) {
      const dateString = tempDate.toISOString().split('T')[0];
      const day = tempDate.getDate().toString().padStart(2, '0');
      const month = (tempDate.getMonth() + 1).toString().padStart(2, '0');
      const year = tempDate.getFullYear();
      const dayName = tempDate.toLocaleString('en-US', { weekday: 'long' });
      const dayType = tempDate.getDay(); // 0 = Sunday, 6 = Saturday

      planDates.push(`${day}/${month}/${year}`);
      planDates2.push(dateString);
      dayNames.push(dayName);
      dayTypes.push(dayType);

      // Move to the next day
      tempDate.setDate(tempDate.getDate() + 1);
    }

    // Create an Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Team Plan');

    // Set up the worksheet headers
    worksheet.columns = [
      { header: 'mat', width: 15 },
      { header: 'Name', width: 20 },
      ...dayNames.map((date) => ({ header: date, width: 15 })),
    ];

    worksheet.addRow(['', '', ...planDates]);

    // Style the headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(2).font = { italic: true };

    // Highlight weekends
    dayTypes.forEach((dayType, index) => {
      if (dayType === 0 || dayType === 6) {
        const column = worksheet.getColumn(index + 3); // Account for the two initial columns
        column.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' },
          };
        });
      }
    });

    // Process and add the plan data to the worksheet
    const collabMap = new Map();

    plans.forEach((plan) => {
      const { mat, name, lastName } = plan; // Destructure directly from plan
      const userPlans = plan.plans; // Assuming plans is an array within each user

      // Ensure we only add a collab once and group their dates
      if (!collabMap.has(mat)) {
        collabMap.set(mat, { mat, name, lastName, dates: new Set() });
      }

      // If plans exist, iterate over them to add the dates
      userPlans.forEach((userPlan) => {
        const planDate = userPlan.date; // Assuming each plan has a date
        collabMap.get(mat).dates.add(planDate);
      });
    });

    // Populate the worksheet with user data and their respective plans
    collabMap.forEach((collab) => {
      const rowData = [
        collab.mat,
        `${collab.name} ${collab.lastName}`,
        ...planDates2.map((date) => (collab.dates.has(date) ? 'X' : '')),
      ];

      const row = worksheet.addRow(rowData);

      // Style the intersecting date cells
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (rowData[colNumber - 1] === 'X') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '0096FF' },
          };
        }
      });
    });

    // Add borders to all cells
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Prepare the response to send the Excel file
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="team-plan.xlsx"',
    );

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  }

  async ExtractTimes(
    res,
    idRespo: number,
    teamId: number,
    start: string,
    end: string,
  ) {
    let teamIds: number[] = [];

    if (teamId == -1) {
      const teams = await this.teamService.findTeamByRespo(idRespo);

      teamIds = teams.map((team) => team.id);
      teamIds = await this.teamService.getAllTeamIdsWithChildren(teamIds);
    } else {
      // Get all team IDs including the children teams
      teamIds = await this.teamService.getAllTeamIdsWithChildren([teamId]);
    }

    try {
      // Fetch all collaborators (collabs) for the selected teams
      const collabs = await this.userRepository.find({
        where: {
          team: { id: In(teamIds) }, // Filter collabs by team IDs
        },
        select: ['id', 'name', 'lastName', 'mat'],
      });

      const dailyWorks = await this.dailyWorkRepository.find({
        where: {
          Collab: {
            team: { id: In(teamIds) }, // Access team through Collab
          },
          date: Between(start, end),
        },
        select: ['date', 'Collab', 'time', 'workStatus'], // Ensure 'time' is selected
        relations: ['Collab', 'Collab.team'], // Load the team relation through Collab
      });

      const plansByCollabId = new Map<number, any[]>();
      dailyWorks.forEach((dailyWork) => {
        const collabId = dailyWork.Collab.id;
        if (!plansByCollabId.has(collabId)) {
          plansByCollabId.set(collabId, []);
        }
        plansByCollabId.get(collabId).push(dailyWork);
      });

      const combinedData = collabs.map((collab) => {
        return {
          ...collab,
          dailyWorks: plansByCollabId.get(collab.id) || [],
        };
      });

      await this.generateTimeExcel(res, combinedData, start, end);
    } catch (error) {
      console.error('Error fetching team plans:', error);
      throw new Error('Failed to export team plans.');
    }
  }

  async generateTimeExcel(res, plans: any[], start: string, end: string) {
    // Parse and validate the start and end dates
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Validate that the start and end dates are in the correct order
    if (startDate > endDate) {
      throw new Error('Start date cannot be greater than the end date.');
    }

    // Calculate the date range between start and end dates
    const planDates: string[] = [];
    const planDates2: string[] = [];
    const dayNames: string[] = [];
    const dayTypes: number[] = [];

    let tempDate = new Date(startDate);
    while (tempDate <= endDate) {
      const dateString = tempDate.toISOString().split('T')[0];
      const day = tempDate.getDate().toString().padStart(2, '0');
      const month = (tempDate.getMonth() + 1).toString().padStart(2, '0');
      const year = tempDate.getFullYear();
      const dayName = tempDate.toLocaleString('en-US', { weekday: 'long' });
      const dayType = tempDate.getDay(); // 0 = Sunday, 6 = Saturday

      planDates.push(`${day}/${month}/${year}`);
      planDates2.push(dateString);
      dayNames.push(dayName);
      dayTypes.push(dayType);

      // Move to the next day
      tempDate.setDate(tempDate.getDate() + 1);
    }

    // Create an Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Team Plan');

    // Set up the worksheet headers
    worksheet.columns = [
      { header: 'MAT', width: 15 },
      { header: 'Name', width: 20 },
      ...dayNames.map((date) => ({ header: date, width: 25 })), // Increased width for time display
    ];

    worksheet.addRow(['', '', ...planDates]);

    // Style the headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(2).font = { italic: true };

    // Highlight weekends
    dayTypes.forEach((dayType, index) => {
      if (dayType === 0 || dayType === 6) {
        const column = worksheet.getColumn(index + 3); // Account for the two initial columns
        column.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' },
          };
        });
      }
    });

    // Process and add the plan data to the worksheet
    const collabMap = new Map();

    // Process and add the plan data to the worksheet
    plans.forEach((plan) => {
      const { mat, name, lastName } = plan; // Destructure directly from plan
      const userPlans = plan.dailyWorks; // Assuming plans is an array within each user

      // Ensure we only add a collab once and group their times
      if (!collabMap.has(mat)) {
        collabMap.set(mat, { mat, name, lastName, timesByDate: new Map() });
      }

      // If plans exist, iterate over them to add the times for each date
      userPlans.forEach((userPlan) => {
        const planDate = userPlan.date; // Assuming each plan has a date
        const workStatus = userPlan.workStatus; // Assuming each plan has a workStatus (true/false)
        const timeData = userPlan.time; // Assuming each plan has a startTime

        // Set times based on work status
        const time = workStatus
          ? `start: ${timeData}` // Work status is true -> start time
          : `break: ${timeData}`; // Work status is false -> break time

        // If this date hasn't been added for the collab yet, initialize it
        if (!collabMap.get(mat).timesByDate.has(planDate)) {
          collabMap.get(mat).timesByDate.set(planDate, []);
        }

        // Add the time to the corresponding date
        collabMap.get(mat).timesByDate.get(planDate).push(time);
      });
    });

    // Populate the worksheet with user data and their respective times
    collabMap.forEach((collab) => {
      const rowData = [
        collab.mat,
        `${collab.name} ${collab.lastName}`,
        ...planDates2.map((date) => {
          const times = collab.timesByDate.get(date) || [];
          return times.length > 0 ? times.join(' | ') : ''; // Join times with " | "
        }),
      ];

      const row = worksheet.addRow(rowData);

      // Style the intersecting date cells
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (rowData[colNumber - 1] !== '') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '0096FF' },
          };
        }
      });
    });

    // Add borders to all cells
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Prepare the response to send the Excel file
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="team-plan.xlsx"',
    );

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  }
}
