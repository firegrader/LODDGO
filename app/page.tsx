'use client';

import { useState, useEffect } from 'react';

interface AuthData {
  provider: string;
  user_id: string;
  email: string;
  name: string;
  authenticated_at: string;
}

export default function Home() {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const authData = localStorage.getItem('loddgo_organizer_auth');
        if (authData) {
          try {
            setAuth(JSON.parse(authData));
          } catch (e) {
            setAuth(null);
          }
        } else {
          setAuth(null);
        }
      }
    };
    
    checkAuth();
    
    // Listen for storage changes (e.g., login/logout in another tab)
    window.addEventListener('storage', checkAuth);
    
    // Also listen for custom events (e.g., login/logout in same tab)
    window.addEventListener('loddgo_auth_change', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('loddgo_auth_change', checkAuth);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 100,
        padding: '16px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: '700',
              fontFamily: 'sans-serif'
            }}>
              L
            </div>
            <span style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>LoddGo</span>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a href="#features" style={{ color: '#374151', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Features</a>
            <a href="#how-it-works" style={{ color: '#374151', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>How it Works</a>
            <a href="#about" style={{ color: '#374151', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>About</a>
            {mounted && auth ? (
              <>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Signed in as {auth.name}</span>
                <a 
                  href="/admin" 
                  className="blue-button"
                  style={{
                    padding: '10px 24px',
                    background: '#2563eb',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'background 0.2s'
                  }}
                >
                  DASHBOARD
                </a>
              </>
            ) : (
              <a 
                href="/admin" 
                className="blue-button"
                style={{
                  padding: '10px 24px',
                  background: '#2563eb',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'background 0.2s'
                }}
              >
                Use the App
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        padding: '80px 24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center'
        }}>
          {/* Left: Text Content */}
          <div>
            <h1 style={{
              fontSize: '56px',
              fontWeight: '800',
              lineHeight: '1.1',
              color: '#111827',
              marginBottom: '24px'
            }}>
              Take the Hard Work out of
              <span style={{ color: '#2563eb' }}> Fundraising</span>
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#64748b',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Your free raffle management app for schools and clubs. Create events, sell tickets, and run live draws—all in one place.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a 
                href="#how-it-works"
                style={{
                  padding: '16px 32px',
                  background: 'transparent',
                  color: '#2563eb',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  border: '2px solid #2563eb',
                  display: 'inline-block',
                  transition: 'all 0.2s'
                }}
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right: Visual Mockup */}
          <div style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              width: '300px',
              height: '600px',
              background: '#ffffff',
              borderRadius: '40px',
              padding: '20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              border: '8px solid #111827'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                borderRadius: '30px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#f97316', marginBottom: '8px' }}>LoddGo</div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>Live Raffle</div>
                </div>
                <div style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px',
                  flex: 1
                }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Event: School Fundraiser</div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Price: 10 NOK per ticket</div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>Tickets sold: 45</div>
                  <div style={{
                    background: '#f97316',
                    color: '#ffffff',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}>
                    Buy Tickets
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '80px 24px',
        background: '#ffffff'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '40px',
            fontWeight: '700',
            textAlign: 'center',
            color: '#111827',
            marginBottom: '16px'
          }}>
            Everything You Need
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            Simple tools to manage your raffle from start to finish
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            <div style={{
              padding: '32px',
              background: '#f9fafb',
              borderRadius: '16px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#eff6ff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '24px' }}>🎫</span>
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px'
              }}>
                Easy Ticket Sales
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                Participants can buy tickets instantly with a simple event code. No accounts needed.
              </p>
            </div>

            <div style={{
              padding: '32px',
              background: '#f9fafb',
              borderRadius: '16px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#eff6ff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '24px' }}>📊</span>
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px'
              }}>
                Real-Time Dashboard
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                Monitor ticket sales, revenue, and participation in real-time from your control panel.
              </p>
            </div>

            <div style={{
              padding: '32px',
              background: '#f9fafb',
              borderRadius: '16px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#eff6ff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '24px' }}>🎲</span>
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px'
              }}>
                Live Draws
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                Run transparent, live draws with instant results. Winners are announced immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        padding: '80px 24px',
        background: '#f9fafb'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '40px',
            fontWeight: '700',
            textAlign: 'center',
            color: '#111827',
            marginBottom: '16px'
          }}>
            How It Works
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            Get started in minutes
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: '#2563eb',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#ffffff',
                fontSize: '28px',
                fontWeight: '700'
              }}>
                1
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px'
              }}>
                Create Event
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                Sign in and create your raffle event. Set the price and you're ready to go.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: '#2563eb',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#ffffff',
                fontSize: '28px',
                fontWeight: '700'
              }}>
                2
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px'
              }}>
                Share Event Code
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                Share your unique event code or QR code with participants.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: '#2563eb',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#ffffff',
                fontSize: '28px',
                fontWeight: '700'
              }}>
                3
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px'
              }}>
                Sell Tickets
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                Participants buy tickets instantly. Watch sales in real-time.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: '#2563eb',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#ffffff',
                fontSize: '28px',
                fontWeight: '700'
              }}>
                4
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px'
              }}>
                Run Draw
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                Run a live draw and announce winners instantly. Results are transparent and fair.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        color: '#ffffff',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '40px',
            fontWeight: '700',
            marginBottom: '20px'
          }}>
            Ready to Get Started?
          </h2>
          <p style={{
            fontSize: '20px',
            marginBottom: '0',
            opacity: 0.9
          }}>
            Create your first raffle event in minutes. It's free and easy.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 24px',
        background: '#111827',
        color: '#9ca3af'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: '700'
              }}>
                L
              </div>
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>LoddGo</span>
            </div>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Live raffle app for school and club fundraisers
            </p>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <a href="#features" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Features</a>
            <a href="#how-it-works" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>How it Works</a>
            <a href="/admin" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Login</a>
          </div>
        </div>
        <div style={{
          maxWidth: '1200px',
          margin: '40px auto 0',
          paddingTop: '24px',
          borderTop: '1px solid #374151',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          <p style={{ margin: 0 }}>© 2024 LoddGo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
