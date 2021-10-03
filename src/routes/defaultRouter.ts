import {Response} from "express";
import 'reflect-metadata'
import {Controller, Get, Res} from "routing-controllers";

@Controller()
export class DefaultRouter {
    @Get('*')
    handleGet(@Res() response: Response) {
        return response.sendFile('./frontend/index.html');
    }
}