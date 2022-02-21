interface System {
  name: string
  description: string
  storageDeadLine: number
  lateShippingFee: number
  capacityPerQuais: number
  quaisFeePerDay: number
  createdAt: Date
  updatedAt?: Date
}
