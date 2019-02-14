import axios from 'axios';
import { isIP } from 'net';

const getPubIpUrl = [
	'https://api.ipify.org',
	'https://canhazip.com',
	'https://ident.me',
	'https://whatismyip.akamai.com',
	'https://myip.dnsomatic.com',
];

/** 获取用户公网IP地址 */
export async function getPubIp() {
	for (const item of getPubIpUrl) {
		try {
			const data = (await axios.get(item)).data.trim();
			/** 成功获取IP地址 */
			if (data && isIP(data)) {
				return data;
			}
		} catch (error) {
			return null;
		}
	}
	return null;
}
