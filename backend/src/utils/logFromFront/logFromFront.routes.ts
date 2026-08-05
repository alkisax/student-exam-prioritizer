import { Router } from 'express'
import { logFromFront } from './logFromFront.controller'

const router = Router()

router.post('/', logFromFront)

export default router