import { ArrowLeftOutlined, CalendarOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Empty, Row, Space, Tag, Typography } from 'antd';
import { useEffect } from 'react';
import { history, useModel, useParams } from 'umi';

const { Title, Text } = Typography;

const ChiTiet = () => {
	const { slug } = useParams<{ slug: string }>();
	const { dsPosts, incrementView } = useModel('blog');
	const { dsTags } = useModel('tag');

	const post = dsPosts.find((p) => p.slug === slug);

	useEffect(() => {
		if (post) {
			incrementView(post.id);
		}
		window.scrollTo(0, 0);
	}, [slug]);

	if (!post) {
		return (
			<div style={{ padding: 100, textAlign: 'center' }}>
				<Empty description='Bài viết không tồn tại hoặc đã bị gỡ bỏ.' />
				<Button onClick={() => history.push('/')}>Quay lại trang chủ</Button>
			</div>
		);
	}

	const relatedPosts = dsPosts
		.filter((p) => p.id !== post.id && p.status === 'published' && p.tags.some((tagId) => post.tags.includes(tagId)))
		.slice(0, 3);

	return (
		<div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
			<Button icon={<ArrowLeftOutlined />} onClick={() => history.push('/')} style={{ marginBottom: 24 }}>
				Quay lại danh sách
			</Button>

			<img
				src={post.thumbnail}
				alt={post.title}
				style={{ width: '100%', borderRadius: 12, marginBottom: 32, maxHeight: 450, objectFit: 'cover' }}
			/>

			<Title>{post.title}</Title>

			<Space split={<Divider type='vertical' />} style={{ marginBottom: 24, color: '#8c8c8c' }}>
				<span>
					<UserOutlined /> {post.author?.name || 'Tác giả'}
				</span>
				<span>
					<CalendarOutlined /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}
				</span>
				<span>
					<EyeOutlined /> {post.viewCount || 0} lượt xem
				</span>
			</Space>

			<div style={{ fontSize: '18px', lineHeight: '1.8', color: '#262626', marginBottom: 48 }}>
				<div style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
			</div>

			<div style={{ marginBottom: 64 }}>
				<Text strong style={{ marginRight: 12 }}>
					Chủ đề:
				</Text>
				{post.tags.map((tid) => (
					<Tag key={tid} color='blue'>
						{dsTags.find((t) => t.id === tid)?.name || tid}
					</Tag>
				))}
			</div>

			{relatedPosts.length > 0 && (
				<div style={{ marginTop: 64 }}>
					<Divider orientation='left'>
						<Title level={4}>Bài viết liên quan</Title>
					</Divider>
					<Row gutter={[16, 16]}>
						{relatedPosts.map((rp) => (
							<Col xs={24} sm={8} key={rp.id}>
								<Card
									hoverable
									size='small'
									cover={<img alt={rp.title} src={rp.thumbnail} style={{ height: 120, objectFit: 'cover' }} />}
									onClick={() => history.push(`/post/${rp.slug}`)}
								>
									<Card.Meta
										title={
											<Text strong ellipsis>
												{rp.title}
											</Text>
										}
										description={
											<Text type='secondary' ellipsis>
												{rp.summary}
											</Text>
										}
									/>
								</Card>
							</Col>
						))}
					</Row>
				</div>
			)}
		</div>
	);
};

export default ChiTiet;