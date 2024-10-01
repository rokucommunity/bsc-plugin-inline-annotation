import type { BeforeFileTranspileEvent, CompilerPlugin } from 'brighterscript';
import { Parser, WalkMode, createVisitor, isBrsFile, isXmlFile } from 'brighterscript';
import SGParser from 'brighterscript/dist/parser/SGParser';
import { SGChildren } from 'brighterscript/dist/parser/SGTypes';

export class Plugin implements CompilerPlugin {
	name = 'bsc-plugin-awesome';

	beforeFileTranspile(event: BeforeFileTranspileEvent) {
		if (isBrsFile(event.file)) {
			event.file.ast.walk(createVisitor({
				FunctionStatement: (functionStatement) => {
					const printStatement = Parser.parse(`print "hello from ${functionStatement.name.text}"`).statements[0];

					//prepend a print statement to the top of every function body
					event.editor.arrayUnshift(functionStatement.func.body.statements, printStatement);
				}
			}), {
				walkMode: WalkMode.visitAllRecursive
			});

		} else if (isXmlFile(event.file)) {
			//prepend a label to every xml file (why? just for fun....)
			const parser = new SGParser();
			parser.parse('generated.xml', `
				<component name="Generated">
					<children>
						<label text="Hello from ${event.file.ast.component!.name}" />
					</children>
				</component>
			`);

			const label = parser.ast.component!.children.children[0];

			//ensure the <children> component exists
			if (!event.file.ast.component!.children) {
				event.file.ast.component!.children = new SGChildren();
			}
			event.editor.arrayUnshift(
				event.file.ast.component!.children.children,
				label
			);
		}
	}
}
