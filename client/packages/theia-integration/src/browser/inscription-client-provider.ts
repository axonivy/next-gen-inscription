import { InscriptionClient } from "@axonivy/inscription-core";

export const InscriptionClientProvider = Symbol('InscriptionClientProvider');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface InscriptionClientProvider {
    get(): Promise<InscriptionClient>;
}
