import { Body, Controller, Get, Query, UseGuards } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtAuthGuard } from "./auth/jwt-auth-guard";
import { CurrentUser } from "./auth/current-user-decorator";
import * as jwtStrategy from "./auth/jwt.strategy";
import { z } from 'zod'
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";

const pageQueryParamSchema = z.string().optional().default('1').transform(Number).pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class FetchRecentQuestionsController {
  constructor(
    private prisma: PrismaService,
  ) { }

  @Get()
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamSchema
  ) {
    const perPage = 1

    const questions = await this.prisma.question.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: {
        createdAt: "desc"
      },
    })

    return {
      questions
    }
  }


}