import type { AfterValidateFileEvent, BeforeBuildProgramEvent, BeforePrepareFileEvent, CompilerPlugin } from 'brighterscript';
import { FileValidator } from './FileValidator';
import { FileTranspiler } from './FileTranspilers';

export class Plugin implements CompilerPlugin {
	name = 'bsc-plugin-inline-annotation';

	private fileValidator = new FileValidator();
	private fileTranspiler = new FileTranspiler();

	afterValidateFile(event: AfterValidateFileEvent) {
		this.fileValidator.validateFile(event.program, event.file);
	}

	beforeBuildProgram(event: BeforeBuildProgramEvent) {
		this.fileValidator.reset();

		// Get a map of all annotated functions (from every file in the program, not just the ones being built)
		for (const file of Object.values(event.program.files)) {
			this.fileValidator.findAnnotations(file);
		}
	}

	beforePrepareFile(event: BeforePrepareFileEvent) {
		this.fileTranspiler.preprocess(event.file, event.editor, this.fileValidator.annotatedFunctions);
	}
}
