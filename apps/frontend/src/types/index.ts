export type Application = {
  identifier: string
  name: string
  parameters: {
    icons: {
      format: 'png'
      width?: number
      height?: number
      image: {
        data: Buffer
      }
    }[]
    version: string
  }
}

export type Script = {
  name: string
  code: string
}

export type Job = {
  id: string
  name: string
}

export type ApplicationLogEvent =  {
  jobId: string
  jobName: string
  message: string
}