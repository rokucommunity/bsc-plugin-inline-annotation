import type { BscFile, FunctionStatement, Program } from 'brighterscript';
import { isReturnStatement, ParseMode, createVisitor, isBrsFile, WalkMode } from 'brighterscript';
import { diagnostics } from './diagnostics';

export class FileValidator {
	public annotatedFunctions = new Map<string, FunctionStatement>();

	public reset() {
		this.annotatedFunctions.clear();
	}

	/**
	 * Find every `@inline` function in the file and add it to the map of annotated functions
	 */
	public findAnnotations(file: BscFile) {
		this.walkInlineFunctions(file, (statement) => {
			this.annotatedFunctions.set(statement.getName(ParseMode.BrighterScript).toLowerCase(), statement);
		});
	}

	/**
	 * Register diagnostics for any `@inline` function in the file whose body is not a single return statement
	 */
	public validateFile(program: Program, file: BscFile) {
		this.walkInlineFunctions(file, (statement) => {
			const bodyStatements = statement.func.body.statements;

			if (bodyStatements.length !== 1 || !isReturnStatement(bodyStatements[0])) {
				program.diagnostics.register(
					diagnostics.badAnnotationBody(
						bodyStatements[bodyStatements.length - 1] ?? statement.func
					)
				);
			}
		});
	}

	private walkInlineFunctions(file: BscFile, callback: (statement: FunctionStatement) => void) {
		if (isBrsFile(file)) {
			file.ast.walk(createVisitor({
				FunctionStatement: (statement) => {
					if (statement.annotations?.find(annotation => annotation.name.toLowerCase() === 'inline')) {
						callback(statement);
					}
				}
			}), {
				walkMode: WalkMode.visitStatements
			});
		}
	}
}
