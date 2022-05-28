import { PostNotFoundException } from '@common/exceptions';
import { PrismaService } from '@common/prisma/prisma.service';
import { PrismaError } from '@common/prisma/prismaError';
import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaPostResponseObject } from './decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPostDto: CreatePostDto,
    userId: string,
  ) {
    try {
      const slug = await this.generateSlug(
        createPostDto.title,
      );

      const post = await this.prisma.post.create({
        data: {
          title: createPostDto.title,
          description: createPostDto.description,
          is_active: true,
          slug: slug,
          authorId: userId,
        },
      });

      return post;
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (
          error.code ===
          PrismaError.RecordAlreadyExists
        ) {
          throw new HttpException(
            'Title Already Exisits',
            HttpStatus.CONFLICT,
          );
        }
      }
      throw error;
    }
  }

  async findAll(userId: string) {
    return await this.prisma.post.findMany({
      where: {
        authorId: userId,
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.post.findUnique({
      where: {
        id: id,
      },
    });
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
  ) {
    try {
      return await this.prisma.post.update({
        data: {
          ...updatePostDto,
        },
        where: {
          id: id,
        },
        select: PrismaPostResponseObject,
      });
    } catch (error) {
      if (
        error instanceof
          PrismaClientKnownRequestError &&
        error.code ===
          PrismaError.RecordDoesNotExist
      ) {
        throw new PostNotFoundException(id);
      }
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }

  async generateSlug(title: string) {
    const slug = title
      .toLowerCase()
      .replace(/ /g, '-');

    const slugCount =
      await this.prisma.post.count({
        where: {
          slug: {
            contains: slug,
          },
        },
      });

    if (slugCount > 0) {
      return slug + '-' + slugCount;
    }
    return slug;
  }
}
