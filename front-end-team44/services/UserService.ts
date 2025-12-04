const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
}

interface LoginResponse {
  token: string
  expiresIn: number
  user: {
    id: number
    name: string
    email: string
    username: string
  }
}

const getAll = () => {
  return fetch(`${API_BASE_URL}/players`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

const getUsersWithCards = () => {
  return fetch(`${API_BASE_URL}/cards`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

const login = async (loginData: LoginData): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Login failed')
  }

  return response.json()
}

const register = async (registerData: RegisterData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(registerData),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Registration failed')
  }

  return response.json()
}

const getCurrentUser = (token: string) => {
  return fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })
}

const logout = (token: string) => {
  return fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ token }),
  })
}

const UserService = {
  getAll,
  getUsersWithCards,
  login,
  register,
  getCurrentUser,
  logout,
}

export default UserService
  