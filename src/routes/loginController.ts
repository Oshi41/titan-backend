import 'reflect-metadata'
import {BadRequestError, Controller, ForbiddenError, Get, QueryParam} from "routing-controllers";
import {store as _store, pass as _transformer} from '../index';

@Controller()
export class LoginController {

    @Get('/login')
    handleLogin(@QueryParam('login', {required: true}) login: string, @QueryParam('pass', {required: true}) pass: string) {
        return _store.check(login, _transformer.transform(pass))
            .then(x => {
                if (x.valueOf()) {
                    return 'OK:' + login;
                }

                throw new ForbiddenError('wrong login or pass');
            })
            .catch(x => {
                if (typeof x === 'string') {
                    throw new BadRequestError(x);
                }
            })
    }

    @Get('/busy')
    handleBusy(@QueryParam('login', {required: true}) login: string) {
        return _store.busy(login)
            .then(x => x.valueOf() ? 'busy' : 'free')
            .catch(x => {
                if (typeof x === 'string') {
                    throw new BadRequestError(x);
                }
            })
    }
}