import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: CreateUserDto) {
    const existingUser = await this.userService.findOne(dto.username);
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.create(dto.username, hashedPassword);
    return { userId: user.userId, username: user.username };
  }

  async login(username: string, password: string) {
    const user = await this.userService.findOne(username);
    if (!user) throw new UnauthorizedException('User not found!');

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches)
      throw new UnauthorizedException('Invalid Credentials');

    const payload = {
      username: user.username,
      userId: user.userId,
      role: user.roles,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
