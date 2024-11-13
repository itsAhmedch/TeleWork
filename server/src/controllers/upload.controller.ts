import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { Response } from 'express';

@Controller('upload')
export class UploadController {
  @Post('/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadDir = './uploads';

          // Check if the directory exists, if not, create it
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          // Clear existing files in the directory
          fs.readdirSync(uploadDir).forEach((file) => {
            fs.unlinkSync(path.join(uploadDir, file));
          });

          callback(null, uploadDir);
        },
        filename: (req, file, callback) => {
          const ext = extname(file.originalname);
          const filename = `HomeImg${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      path: `/uploads/${file.filename}`,
    };
  }

  @Get('/image')
  getImage(@Res() res: Response) {
    const uploadDir = './uploads';

    // Check if the directory exists before attempting to read files
    if (!fs.existsSync(uploadDir)) {
      return res.status(404).send('File not found');
    }

    const fileNames = fs.readdirSync(uploadDir);
    const file = fileNames.find((name) => name.startsWith('HomeImg'));

    if (file) {
      const filePath = path.join(uploadDir, file);
      res.sendFile(filePath, { root: '.' });
    } else {
      res.status(404).send('File not found');
    }
  }
}
