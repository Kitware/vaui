export default (a, b) => {
    var startTs = a['ts0'];
    var steps = b['ts0'] - startTs - 1;
    var start1 = a['g0'][0][0];
    var start2 = a['g0'][0][1];
    var start3 = a['g0'][1][0];
    var start4 = a['g0'][1][1];
    var d1 = (b['g0'][0][0] - start1) / steps;
    var d2 = (b['g0'][0][1] - start2) / steps;
    var d3 = (b['g0'][1][0] - start3) / steps;
    var d4 = (b['g0'][1][1] - start4) / steps;
    var newDetections = [];
    for (let i = 1; i < steps + 1; i++) {
        newDetections.push({
            'src': 'linear-interpolation',
            'g0': [
                [
                    Math.round(start1 + i * d1),
                    Math.round(start2 + i * d2)
                ],
                [
                    Math.round(start3 + i * d3),
                    Math.round(start4 + i * d4)
                ]
            ],
            'occlusion': '',
            'ts0': startTs + i
        })
    }
    return newDetections
}
