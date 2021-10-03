import {PassTransformer} from "./passTransformer";

/**
 * Никаких преобразований
 */
export class PlainPass implements PassTransformer{
    transform(pass: string): string {
        return pass;
    }
}