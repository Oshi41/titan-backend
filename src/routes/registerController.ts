import 'reflect-metadata'
import {BadRequestError, Body, Controller, HttpError, InternalServerError, Post, Res} from "routing-controllers";
import {Response} from 'express';
import {LoginRequest} from "../types/types";
import {store as _store, pass as _transformer} from '../index';

@Controller()
export class RegisterController {
    @Post('/register')
    postRegister(@Res() response: Response, @Body({required: true}) body: LoginRequest) {

        if (!body.login){
            throw new BadRequestError('No login provided');
        }

        if (body.pass.length < 5){
            throw new BadRequestError('Password is empty or less than 5 symbols length');
        }

        // Сначала смотрим свободно ли
        return _store.busy(body.login)
            .then(x => {
                // свободно
                if (!x.valueOf()) {
                    // пытаемся вписать нового юзера
                    return _store.add(body.login, _transformer.transform(body.pass));
                }

                throw new BadRequestError('already taken');
            })
            .then(x => {
                // вставка прошла успешно
                if (x.valueOf()) {
                    return true;
                }

                throw new InternalServerError('error in database');
            })
            .then(x => 'success')
            .catch(x => {
                if (typeof x === 'string') {
                    throw new BadRequestError(x);
                }
            })
    }
}