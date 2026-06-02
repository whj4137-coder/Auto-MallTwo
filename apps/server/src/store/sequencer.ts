// OrderSequencer — ORDER-P-NNN / ORDER-M-NNN 两类独立递增，重置归零。PRD §10.5。

export class OrderSequencer {
  private seqP = 0;
  private seqM = 0;

  nextP(): string {
    this.seqP += 1;
    return `ORDER-P-${String(this.seqP).padStart(3, "0")}`;
  }

  nextM(): string {
    this.seqM += 1;
    return `ORDER-M-${String(this.seqM).padStart(3, "0")}`;
  }

  reset(): void {
    this.seqP = 0;
    this.seqM = 0;
  }

  snapshot() {
    return { seqP: this.seqP, seqM: this.seqM };
  }
}
