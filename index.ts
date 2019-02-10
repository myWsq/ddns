import AliyunDnsService from './service/aliyunDnsService';
import config from './config';
import 'reflect-metadata';
import { createConnection } from 'typeorm';

createConnection()

const aliyunService = new AliyunDnsService(config.aliyun);

aliyunService.run()
