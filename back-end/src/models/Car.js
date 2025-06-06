import { z } from 'zod'
const validColors = [
  'AMARELO',
  'AZUL',
  'BRANCO',
  'CINZA',
  'DOURADO',
  'LARANJA',
  'MARROM',
  'PRATA',
  'PRETO',
  'ROSA',
  'ROXO',
  'VERDE',
  'VERMELHO'
]
const maxSellingDate = new Date()
const currentYear = new Date().getFullYear()
const minSellingDate = new Date('2020-01-01')

const Car = z.object({
  brand: z.string()
     .trim()
      .min(1, { message: 'A marca deve ter, no mínimo, 1 caractere.' })
       .max(25, { message: 'A marca deve ter, no máximo, 25 caracteres.' }),
  model: z.string()
    .trim()
     .min(1, { message: 'O modelo deve ter, no mínimo, 1 caractere.' })
      .max(25, { message: 'O modelo deve ter, no máximo, 25 caracteres.' }),
  color: z.enum(validColors, { message: 'Cor inválida.' }),
  year_manufacture: z.number()
    .int({ message: 'O ano de fabricação deve ser um número inteiro.' })
     .min(1960, { message: 'O ano de fabricação deve ser, no mínimo, 1960.' })
      .max(currentYear, { message: `O ano de fabricação deve ser, no máximo, ${currentYear}.` }),
  imported: z.boolean({ required_error: 'O campo importado é obrigatório.' }),
  plates: z.string()
    .transform(val => val.replace(/[\s-]/g, ''))
     .refine(val => val.length === 7, { message: 'A placa deve ter exatamente 7 caracteres.' }),
  selling_date: z.coerce.date()
    .min(minSellingDate, { message: 'A data de venda não pode ser anterior a 01/01/2020.' })
     .max(maxSellingDate, { message: 'A data de venda não pode ser no futuro.' })
     .nullish(), 
  selling_price: z.coerce.number()
    .min(1000, { message: 'O preço de venda deve ser, no mínimo, R$ 1.000,00.' })
     .max(5000000, { message: 'O preço de venda deve ser, no máximo, R$ 5.000.000,00.' })
      .nullish(), 
  customer_id: z.coerce.number()
     .int({ message: 'ID do cliente deve ser um número inteiro.' })
      .positive({ message: 'ID do cliente deve ser positivo.' })
       .nullish() 
})

export default Car
