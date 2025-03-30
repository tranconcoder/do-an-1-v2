import React from 'react';
import { Result, Button, Typography, Space } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './PendingApprovalScreen.module.scss';

const { Title, Paragraph } = Typography;

const PendingApprovalScreen = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <Result
                icon={<ClockCircleOutlined className={styles.pendingIcon} />}
                title="Shop Registration Pending Approval"
                subTitle="Thank you for registering your shop with us!"
            />

            <div className={styles.content}>
                <Space direction="vertical" size="large" align="center">
                    <Title level={4}>What happens next?</Title>

                    <Paragraph className={styles.paragraph}>
                        Our admin team is reviewing your application. This process usually takes 1-3
                        business days. You'll receive an email notification once your registration
                        has been approved or rejected.
                    </Paragraph>

                    <div className={styles.steps}>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>1</div>
                            <div className={styles.stepContent}>
                                <Title level={5}>Registration Submitted</Title>
                                <Paragraph>
                                    Your shop registration has been received by our team.
                                </Paragraph>
                            </div>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepNumber}>2</div>
                            <div className={styles.stepContent}>
                                <Title level={5}>Under Review</Title>
                                <Paragraph>
                                    Our team is reviewing your shop details and documents.
                                </Paragraph>
                            </div>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepNumber}>3</div>
                            <div className={styles.stepContent}>
                                <Title level={5}>Decision</Title>
                                <Paragraph>
                                    You'll receive an email with our decision. If approved, you can
                                    start setting up your shop!
                                </Paragraph>
                            </div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Button type="primary" onClick={() => navigate('/')}>
                            Back to Home
                        </Button>

                        <Button
                            onClick={() => (window.location.href = 'mailto:support@example.com')}
                        >
                            Contact Support
                        </Button>
                    </div>
                </Space>
            </div>
        </div>
    );
};

export default PendingApprovalScreen;
