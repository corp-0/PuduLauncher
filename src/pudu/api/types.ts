export interface CommandResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GreetCommand {
  name: string;
}

export interface EventBase {
  eventType: string;
  timestamp: string;
}

export interface TimerEvent extends EventBase {
  elapsedTime: string;
}
