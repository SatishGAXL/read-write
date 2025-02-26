import { Contract } from '@algorandfoundation/tealscript';

export class ReadWrite extends Contract {
  name = GlobalStateKey<string>();

  createApplication(): void {
    this.name.value = '';
  }

  writeName(name: string): void {
    this.name.value = name;
  }

  readName(): string {
    return this.name.value;
  }
}
