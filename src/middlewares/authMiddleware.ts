import { Request, Response, NextFunction } from 'express'

export const checkSession = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Check if a user is logged in by checking if there is a session with a user ID
  // @ts-ignore
  const userId = req.session.userId

  // If user ID exists in session, proceed to the next middleware/route handler
  if (userId) {
    next()
  } else {
    res.redirect('/') // If no user ID, redirect to login page
  }
}
