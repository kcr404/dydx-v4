"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxiosServerError = exports.AxiosError = void 0;
const errors_1 = require("../errors");
/**
 * @description An error thrown by axios.
 *
 * Depending on your use case, if logging errors, you may want to catch axios errors and sanitize
 * them to remove the request and response objects, or sensitive fields. For example:
 *
 *   this.originalError = _.omit(originalError.toJSON(), 'config')
 */
class AxiosError extends errors_1.WrappedError {
}
exports.AxiosError = AxiosError;
/**
 * @description Axios error with response error fields.
 */
class AxiosServerError extends AxiosError {
    constructor(response, originalError) {
        super(`${response.status}: ${response.statusText} - ${JSON.stringify(response.data, null, 2)}`, originalError);
        this.status = response.status;
        this.statusText = response.statusText;
        this.data = response.data;
    }
}
exports.AxiosServerError = AxiosServerError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NsaWVudHMvbGliL2F4aW9zL2Vycm9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzQ0FBeUM7QUFhekM7Ozs7Ozs7R0FPRztBQUNILE1BQWEsVUFBVyxTQUFRLHFCQUFZO0NBQUc7QUFBL0MsZ0NBQStDO0FBRS9DOztHQUVHO0FBQ0gsTUFBYSxnQkFBaUIsU0FBUSxVQUFVO0lBSzlDLFlBQVksUUFBNEIsRUFBRSxhQUFpQztRQUN6RSxLQUFLLENBQ0gsR0FBRyxRQUFRLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQyxVQUFVLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxFQUN4RixhQUFhLENBQ2QsQ0FBQztRQUNGLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUM5QixJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUM7UUFDdEMsSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO0lBQzVCLENBQUM7Q0FDRjtBQWRELDRDQWNDIn0=