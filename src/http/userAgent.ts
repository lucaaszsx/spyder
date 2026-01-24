export class UserAgentRotator {
    private agents: string[];
    private currentAgent: number = 0;

    constructor(uaList: string[]) {
        if (uaList.length <= 0) throw new Error('The list of user agents must contain at least one element. Received: 0');
        if (uaList.some((ua) => typeof ua !== 'string')) throw new Error('The user agents must all be of type string');
        
        this.agents = uaList;
    }

    next(): string {
        const agent = this.agents[this.currentAgent];

        this.currentAgent = (this.currentAgent + 1) % this.agents.length;

        return String(agent);
    }
}