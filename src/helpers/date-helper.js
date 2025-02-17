export const dateToEpoch = (dateStr) => {
  return Math.floor(new Date(dateStr).getTime() / 1000.0)
}
