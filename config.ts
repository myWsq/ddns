export interface ConfigInterface {
	aliyun?: AliyunConfigInterface;
}

export interface AliyunConfigInterface {
	accessKeyId: string;
	accessKeySecret: string;
	domains: {
		domainName: string;
		rr: string;
	}[];
}

export default {
	aliyun: {
		accessKeyId: 'LTAI6jKvbdOKJ4eX',
		accessKeySecret: 'S67KOnrjJLfisDdnAMLtSLBpFb0pj5',
		domains: [
			{
				domainName: 'wsq.cool',
				rr: 'home',
			},
			{
				domainName: 'wsq.cool',
				rr: 'home1',
			},
			{
				domainName: 'wsq.cool',
				rr: 'home2',
			},
		],
	},
} as ConfigInterface;
