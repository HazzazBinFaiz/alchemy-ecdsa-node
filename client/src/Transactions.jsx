function Transactions({ transactions }) {

  return (
    <div className="container w-1/2">
      <h1>Transactions</h1>
      <div style={{ overflow: 'auto'}}>
      <table className="w-full" cellSpacing={0}>
        <thead>
          <tr>
            <th className="border p-2">Sender</th>
            <th className="border p-2">Recipient</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(item => (
            <tr>
              <td className="p-2 border">{item.sender}</td>
              <td className="p-2 border">{item.recipient}</td>
              <td className="p-2 border">{item.amount}</td>
              <td className="p-2 border" style={{ whiteSpace: 'nowrap'}}>{(new Date(item.time)).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default Transactions;
