import { expect } from "chai";
import { ODataV4Context } from "../lib";
import { resolveQuery } from "../lib/ODataQuery";

class MyContext extends ODataV4Context {
    constructor() {
        super("http://api.purdue.io/odata/");
    }

    get subjects() { return this.createQuery<Subject>("Subjects"); }
}

describe("ODataConext", () => {
    const context = new MyContext();
    
    it("should create query", async () => {
        const query = context.subjects.filter(p => p.contains("Name", "vet"));

        expect(query[resolveQuery]().toString()).to.be.eql("http://api.purdue.io/odata/Subjects?$filter=contains(Name,'vet')");
        
    });
});

interface Subject {
    SubjectId: string,
    SubjectClusterId: number,
    Name: string;
    Abbreviation: string;
}