import { BadRequestException } from '@nestjs/common'
import { ZodError, z } from 'zod'

export class ZodValidationPipe {
  constructor(private schema: z.ZodTypeAny) { }

  transform(value: unknown) {
    try {
      return this.schema.parse(value)
    } catch (error) {
      if (error instanceof ZodError) {
        const tree = z.treeifyError(error)

        throw new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: tree
        })
      }

      throw new BadRequestException('Validation failed')
    }
  }
}
