import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtAuthGuard } from "./auth/jwt-auth-guard";
import { CurrentUser } from "./auth/current-user-decorator";
import * as jwtStrategy from "./auth/jwt.strategy";
import { z } from 'zod'
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(createQuestionBodySchema)

type createQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  constructor(
    private prisma: PrismaService,
  ) { }

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: createQuestionBodySchema,
    @CurrentUser() user: jwtStrategy.UserPayload
  ) {
    const { title, content } = body
    const userId = user.sub
    const slug = this.convertToSlug(title)

    await this.prisma.question.create({
      data: {
        title,
        content,
        slug: slug,
        authorId: userId
      }
    })
  }

  private convertToSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
  }
}