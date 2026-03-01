export default function DBScanHeader({clusterData}) {
    return(
        <>
            <table>
                <thead>
                <tr>
                    <th>Cluster Number</th>
                    <th>Avg Spam %</th>
                    <th>Avg Urls</th>
                    <th>Avg Email in Name %</th>
                    <th>Avg Contains sexual word %</th>
                    <th>Avg Capital Letter %</th>
                    <th>Avg Contains Currency %</th>
                </tr>
                </thead>
            <tbody>
            {clusterData.map(cluster => (

                <tr key={cluster["clusterId"]} className="text-center hover:text-green-200">
                    <td>{cluster["clusterId"]}</td>
                    <td>{Math.round(cluster["avgSpam"] * 100)}%</td>
                    <td>{cluster["avgUrls"]}</td>
                    <td>{Math.round(cluster["avgEmailInName"] * 100)}%</td>
                    <td>{Math.round(cluster["avgContainsSexualWord"] * 100)}%</td>
                    <td>{Math.round(cluster["avgCapital"] * 100)}%</td>
                    <td>{Math.round(cluster["avgContainsCurrency"] * 100)}%</td>
                </tr>

            ))}
            </tbody>
            </table>
        </>
    );
}