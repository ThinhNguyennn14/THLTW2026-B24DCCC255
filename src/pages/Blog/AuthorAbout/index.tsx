import { FacebookOutlined, GithubOutlined, GlobalOutlined, YoutubeOutlined } from '@ant-design/icons';
import { Avatar, Card, Col, Divider, Row, Space, Tag, Tooltip, Typography } from 'antd';
import { useModel } from 'umi';

const { Title, Paragraph, Text } = Typography;

const AuthorAbout = () => {
	const { dsPosts } = useModel('blog');

	const author = dsPosts[0]?.author;

	if (!author) {
		return (
			<div style={{ padding: '50px', textAlign: 'center' }}>
				<Text type='secondary'>Đang tải thông tin tác giả...</Text>
			</div>
		);
	}

	const getSocialIcon = (platform: string) => {
		switch (platform.toLowerCase()) {
			case 'facebook':
				return <FacebookOutlined />;
			case 'github':
				return <GithubOutlined />;
			case 'youtube':
				return <YoutubeOutlined />;
			default:
				return <GlobalOutlined />;
		}
	};

	return (
		<div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
			<Row gutter={[32, 32]} align='middle'>
				<Col xs={24} md={8} style={{ textAlign: 'center' }}>
					<Avatar
						size={200}
						src={author.avatar}
						style={{
							border: '4px solid #fff',
							boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
							marginBottom: 24,
						}}
					/>
					<Title level={2} style={{ marginBottom: 8 }}>
						{author.name}
					</Title>
					<Text type='secondary' style={{ fontSize: '16px' }}>
						Tác giả nội dung & Nhà phát triển
					</Text>

					<Divider />

					<Title level={5}>Liên kết mạng xã hội</Title>
					<Space size='large' style={{ fontSize: '24px', marginTop: 12 }}>
						{author.socials.map((link, index) => (
							<Tooltip title={link.platform} key={index}>
								<a href={link.url} target='_blank' rel='noopener noreferrer' style={{ color: 'inherit' }}>
									{getSocialIcon(link.platform)}
								</a>
							</Tooltip>
						))}
					</Space>
				</Col>

			
				<Col xs={24} md={16}>
					<Card bordered={false} className='author-card' style={{ background: 'transparent' }}>
						<Title level={3}>Về tôi</Title>
						<Paragraph style={{ fontSize: '16px', lineHeight: '1.8', textAlign: 'justify' }}>{author.bio}</Paragraph>
						<Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
							Chào mừng bạn đến với blog cá nhân của tôi. Đây là nơi tôi chia sẻ những kiến thức về lập trình, kinh
							nghiệm xây dựng ứng dụng và những niềm đam mê trong việc chỉnh sửa video. Hy vọng những nội dung tại đây
							sẽ mang lại giá trị hữu ích cho bạn.
						</Paragraph>

						<Divider orientation='left'>Kỹ năng chuyên môn</Divider>
						<div style={{ marginBottom: 24 }}>
							{author.skills.map((skill, index) => (
								<Tag
									key={index}
									color='blue'
									style={{ padding: '4px 12px', fontSize: '14px', marginBottom: 8, borderRadius: '4px' }}
								>
									{skill}
								</Tag>
							))}
						</div>

						<Divider orientation='left'>Thông tin liên hệ</Divider>
						<Paragraph>
							<Text strong>Email:</Text> thinhnguyen14.ptit@gmail.com <br />
							<Text strong>Địa chỉ:</Text> Học viện Công nghệ Bưu chính Viễn thông (PTIT), Hà Nội.
						</Paragraph>
					</Card>
				</Col>
			</Row>
		</div>
	);
};


export default AuthorAbout;