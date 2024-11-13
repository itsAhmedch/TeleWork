export interface CreateUserDto {
    email: string;
    name: string;
    lastName: string;
    pwd: string;
    role: string;
    teamId: number; // Optional field
    subteamId: number; // Optional field
  }