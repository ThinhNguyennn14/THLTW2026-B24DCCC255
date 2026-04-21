import { Card, Col, Input, Pagination, Row, Space, Tag, Typography } from 'antd';
import { useModel, history } from 'umi';
import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';

const { Title, Paragraph } = Typography;

const TrangChu = () => {
    const { dsPosts } = useModel('blog');
    const { dsTags } = useModel('tag');
    const [search, setSearch] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 9;

    const handleSearch = useCallback(
        debounce((value: string) => {
            setSearch(value);
            setPage(1);
        }, 300),
        [],
    );

    const displayPosts = dsPosts.filter(p => 
        p.status === 'published' &&
        p.title.toLowerCase().includes(search.toLowerCase()) &&
        (selectedTag ? p.tags.includes(selectedTag) : true)
    );

    const currentPosts = displayPosts.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
            <Title level={2}>Danh sách bài viết</Title>
            
            <Space direction="vertical" style={{ width: '100%', marginBottom: 32 }}>
                <Input.Search 
                    placeholder="Tìm kiếm bài viết theo tiêu đề..." 
                    onChange={e => handleSearch(e.target.value)} 
                    allowClear
                    size="large"
                />
                <Space wrap>
                    <span style={{ marginRight: 8 }}>Lọc theo thẻ:</span>
                    <Tag 
                        color={!selectedTag ? 'blue' : 'default'} 
                        onClick={() => setSelectedTag(null)}
                        style={{ cursor: 'pointer' }}
                    >Tất cả</Tag>
                    {dsTags.map(t => (
                        <Tag 
                            key={t.id}
                            color={selectedTag === t.id ? 'blue' : 'default'}
                            onClick={() => setSelectedTag(t.id)}
                            style={{ cursor: 'pointer' }}
                        >{t.name}</Tag>
                    ))}
                </Space>
            </Space>

            <Row gutter={[24, 24]}>
                {currentPosts.map(post => (
                    <Col xs={24} sm={12} md={8} key={post.id}>
                        <Card
                            hoverable
                            cover={<img alt={post.title} src={post.thumbnail} style={{ height: 200, objectFit: 'cover' }} />}
                            onClick={() => history.push(`/post/${post.slug}`)}
                        >
                            <Card.Meta 
                                title={post.title} 
                                description={<Paragraph ellipsis={{ rows: 2 }}>{post.summary}</Paragraph>} 
                            />
                            <div style={{ marginTop: 16 }}>
                                <Paragraph type="secondary" style={{ fontSize: '12px' }}>
                                    Ngày đăng: {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                </Paragraph>
                                <Space wrap>
                                    {post.tags.map(tid => (
                                        <Tag key={tid}>{dsTags.find(t => t.id === tid)?.name}</Tag>
                                    ))}
                                </Space>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {displayPosts.length > pageSize && (
                <div style={{ marginTop: 48, textAlign: 'center' }}>
                    <Pagination 
                        current={page}
                        total={displayPosts.length}
                        pageSize={pageSize}
                        onChange={setPage}
                        showSizeChanger={false}
                    />
                </div>
            )}
        </div>
    );
};

export default TrangChu;