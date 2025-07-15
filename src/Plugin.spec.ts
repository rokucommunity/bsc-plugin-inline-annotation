import { Program, standardizePath as s, util } from 'brighterscript';
import * as fsExtra from 'fs-extra';
import { Plugin } from './Plugin';
import undent from 'undent';
import { expect } from 'chai';

describe('Plugin', () => {
    let program: Program;
    const tempDir = s`${__dirname}/../.tmp`;
    const rootDir = s`${tempDir}/rootDir`;
    const stagingDir = s`${tempDir}/stagingDir`;

    beforeEach(() => {
        fsExtra.emptyDirSync(rootDir);
        fsExtra.emptyDirSync(stagingDir);

        program = new Program({
            rootDir: rootDir,
            stagingDir: stagingDir
        });
        program.plugins.add(new Plugin());
    });

    afterEach(() => {
        fsExtra.removeSync(tempDir);
    });

    it('Verifies basic annotation support', async () => {
        program.setFile('source/main.bs', `
            sub init()
                print subtract(5,3)
            end sub

            @inline
            function subtract(a, b) as integer
                return a - b
            end function
        `);

        //make sure there are no diagnostics
        program.validate();
        expect(
            program.getDiagnostics().map(x => x.message)
        ).to.eql([]);

        //make sure the code transpiles properly
        expect(
            (await program.getTranspiledFileContents('source/main.bs')).code
        ).to.eql(undent`
            sub init()
                print (5 - 3)
            end sub

            function subtract(a, b) as integer
                return a - b
            end function
        `);
    });

    it('Verifies inlineable function body must be a single return statement', () => {
        program.setFile('source/main.bs', `
            sub init()
                print subtract(5,3)
            end sub

            @inline
            function subtract(a, b) as integer
                value = a - b
                return value
            end function
        `);

        //make sure there are no diagnostics
        program.validate();
        expect(
            program.getDiagnostics().map(x => {
                return {
                    message: x.message,
                    range: x.range
                };
            })
        ).to.eql([{
            message: 'Inlineable function body must be a single return statement',
            range: util.createRange(8, 16, 8, 28)
        }]);
    });

    it('vvv', () => {
        program.setFile('source/main.bs', `
            sub init()
                print subtract(5,3)
            end sub

            @inline
            function subtract(a, b) as integer
                value = a - b
            end function
        `);

        //make sure there are no diagnostics
        program.validate();
        expect(
            program.getDiagnostics().map(x => {
                return {
                    message: x.message,
                    range: x.range
                };
            })
        ).to.eql([{
            message: 'Inlineable function body must be a single return statement',
            range: util.createRange(7, 16, 7, 29)
        }]);
    });
});
