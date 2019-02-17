const SECRET_FILE_NAME = 'secretKey';
import * as fs from 'fs';

/** 生成随机字符串 */
function generateSecretKey(): string {
	return require('crypto-random-string')(30);
}

/** 初始化秘钥 */
export function init() {
	if (!fs.existsSync(SECRET_FILE_NAME) || !fs.readFileSync(SECRET_FILE_NAME).toString()) {
		fs.writeFileSync(SECRET_FILE_NAME, generateSecretKey());
	}
}

/** 验证秘钥 */
export async function validateSecretKey(secretKey: string) {
	const secret = await fs.promises.readFile(SECRET_FILE_NAME);
	return secret.toString() === secretKey;
}

export async function setSecretKey(secretKey: string) {
	return await fs.promises.writeFile(SECRET_FILE_NAME, secretKey);
}
