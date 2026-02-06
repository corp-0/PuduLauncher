import type { CommandResult, GreetCommand } from './types';
import { getSidecarBaseUrl } from '../sidecar';

/**
 * API client for greeter commands.
 */
export class GreeterApi {
  async greet(command: GreetCommand): Promise<CommandResult<string>> {
    const baseUrl = await getSidecarBaseUrl();
    const response = await fetch(`${baseUrl}/api/greeter/greet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}
