import { PrismaService } from '@common/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaUserResponseObject } from './decorator/prisma.user.decorator';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaError } from '@common/prisma/prismaError';
import { UserNotFoundException } from '@common/exceptions';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return await this.prisma.user.findMany({
      select: PrismaUserResponseObject,
    });
  }

  async findOne(key: string) {
    const user = await this.prisma.user.findMany({
      where: {
        OR: [
          {
            id: key,
          },
          {
            email: key,
          },
        ],
      },
      select: PrismaUserResponseObject,
    });

    return user;
  }

  async update(params: {
    id: string;
    updateUserDto: UpdateUserDto;
  }) {
    const { id, updateUserDto } = params;
    try {
      return await this.prisma.user.update({
        data: {
          ...updateUserDto,
        },
        where: {
          id: id,
        },
        select: PrismaUserResponseObject,
      });
    } catch (error) {
      if (
        error instanceof
          PrismaClientKnownRequestError &&
        error.code ===
          PrismaError.RecordDoesNotExist
      ) {
        throw new UserNotFoundException(id);
      }
      throw error;
    }
  }

  async remove(id: string) {
    return await this.prisma.user.delete({
      where: {
        id: id,
      },
    });
  }
}
