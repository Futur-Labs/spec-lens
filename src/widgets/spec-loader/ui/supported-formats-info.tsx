export function SupportedFormatsInfo() {
  return (
    <div
      style={{
        marginTop: '2.4rem',
        padding: '1.6rem',
        backgroundColor: 'rgba(7, 93, 70, 0.1)',
        borderRadius: '0.8rem',
        border: '1px solid rgba(7, 93, 70, 0.2)',
      }}
    >
      <h3
        style={{
          color: '#10b981',
          fontSize: '1.3rem',
          fontWeight: 600,
          marginBottom: '0.8rem',
        }}
      >
        지원 포맷
      </h3>
      <ul
        style={{
          color: '#9ca3af',
          fontSize: '1.3rem',
          lineHeight: 1.6,
          margin: 0,
          paddingLeft: '2rem',
        }}
      >
        <li>OpenAPI 3.0.x JSON 파일</li>
      </ul>
    </div>
  );
}
