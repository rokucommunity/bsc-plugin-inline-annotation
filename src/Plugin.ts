import type { AstEditor, CompilerPlugin, Program, TranspileObj } from 'brighterscript';
import { FileValidator } from './FileValidator';
import { FileTranspiler } from './FileTranspilers';

export class Plugin implements CompilerPlugin {
	name = 'bsc-plugin-inline-annotation';

	private fileValidator = new FileValidator();
	private fileTranspiler = new FileTranspiler();
	afterProgramValidate(program: Program) {
		this.fileValidator.reset();

		// Get a map of all annotated functions
		for (const file of Object.values(program.files)) {
			this.fileValidator.findAnnotations(file);
		}
	}

	beforeProgramTranspile(program: Program, entries: TranspileObj[], editor: AstEditor) {
		for (const entry of entries) {
			this.fileTranspiler.preprocess(entry.file, editor, this.fileValidator.annotatedFunctions);
		}
	}
}