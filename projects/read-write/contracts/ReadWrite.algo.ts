import { Contract } from '@algorandfoundation/tealscript';

export class ReadWrite extends Contract {
  // Define a global state key to store the name
  name = GlobalStateKey<string>();

  // CreateApplication method: initializes the contract
  createApplication(): void {
    this.name.value = ''; // Initialize the name to an empty string
  }

  // WriteName method: writes a name to the global state
  writeName(name: string): void {
    this.name.value = name; // Set the global state 'name' to the provided value
  }

  // ReadName method: reads the name from the global state
  readName(): string {
    return this.name.value; // Return the value of the global state 'name'
  }
}
