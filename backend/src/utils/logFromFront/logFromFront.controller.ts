// backend\src\utils\logFromFront\logFromFront.controller.ts
import type { Request, Response } from 'express'

export const logFromFront = async (req: Request, res: Response) => {
  const frontLog = req.body.data

  console.log('Frontend logger:', frontLog)

  return res.status(200).json({ status: true })
}
