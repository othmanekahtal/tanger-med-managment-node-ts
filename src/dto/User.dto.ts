interface User {
  username: string
  email: string
  role?: 'superAdmin' | 'guide' | 'lead-guide' | 'user'
  password?: string
  confirmPassword?: string
  resetToken?: string
  resetTokenExpiration?: number
  updatePasswordAt?: Date
  active?: boolean
  createdAt?: Date
}
