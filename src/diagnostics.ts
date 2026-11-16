import type { BsDiagnosticInput, DiagnosticLocationInput } from 'brighterscript';
import { DiagnosticSeverity } from 'brighterscript';

export const diagnostics = {
	badAnnotationBody: (location: DiagnosticLocationInput): BsDiagnosticInput => ({
		message: 'Inlineable function body must be a single return statement',
		code: 'bad-annotation-body',
		severity: DiagnosticSeverity.Error,
		location: location
	})
};
