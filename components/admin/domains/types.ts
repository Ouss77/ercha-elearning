export interface Domain {
  id: number
  name: string
  description: string | null
  color: string
  coursesCount?: number
  createdAt?: Date
}

export interface DomainFormData {
  name: string
  description: string
  color: string
}

