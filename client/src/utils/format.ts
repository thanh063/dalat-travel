export const money = (n: number) =>
  new Intl.NumberFormat('vi-VN').format(n) + ' đ'

export const dmy = (d: string | Date) =>
  new Date(d).toLocaleString('vi-VN')
