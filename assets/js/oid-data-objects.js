module.export = () =>{
    let black_and_white_loop_info = [
        {inc_name :'black', cartridge_number:1, inc_number:2, max_capacity_bw:3, max_capacity_color: 9}];
    let colors_info = [
        {inc_name:'cyan',   cartridge_number:3, inc_number:4, max_capacity_bw:3, max_capacity_color: 10},
        {inc_name:'magenta',cartridge_number:5, inc_number:6, max_capacity_bw:3, max_capacity_color: 11},
        {inc_name:'yellow', cartridge_number:7, inc_number:8, max_capacity_bw:3, max_capacity_color: 12}];
    let colors_loop_info = black_and_white_loop_info.concat(colors_info);

    let snmpAdresses =[
        {ip: "192.168.67.47",   color: true,   name: 'pr_tln_12k_HP_MFP252n', key: 'pr_tln_12k_HPMFP252n__', max_capacity: false},        //pr-tln-12k-HP_MFP252n
        {ip: "192.168.160.32",  color: false,  name: 'pr_tln_10k_HP2420n',    key: 'pr_tln_10k_HP2420n__',   max_capacity: true},        //pr-tln-10k-HP2420n
        {ip: "192.168.66.30",   color: true,   name: 'pr_tln_10k_HPM476dn',   key: 'pr_tln_10k_HPM476dn__',  max_capacity: false},        //pr-tln-10k-HPM476dn
        {ip:"192.168.66.26",    color: true,   name: 'pr_tln_6k_HPM476dn',    key:'pr_tln_6k_HPM476dn__',    max_capacity: false },        //pr-tln-6k-HPM476dn
        {ip: "192.168.66.13",   color: false,  name: 'pr_tln_6k_HP400dne',    key: 'pr_tln_6k_HP400dne__',   max_capacity: false},        //pr-tln-6k-HP400dne
        {ip: "192.168.67.10",   color: false,  name: 'pr_tln_6k_HP400',       key: 'pr_tln_6k_HP400__',      max_capacity: false},        //pr-tln-6k-HP400
        {ip: "192.168.156.133", color: true,   name: 'pr_tln_6k_HP200',       key: 'pr_tln_6k_HP200__',      max_capacity:false},        //pr-tln-6k-HP200
        {ip: "192.168.66.35",   color: true,   name: 'pr_tln_5k_HP200',       key: 'pr_tln_5k_HP200__',      max_capacity: false},        //pr-tln-5k-HP200
        {ip: "192.168.66.38",   color: true,   name: 'pr_tln_4k_HP5225dn',    key: 'pr_tln_4k_HP5225dn__',   max_capacity: false},        //pr-tln-4k-HP5225dn
        {ip: "192.168.67.15",   color: false,  name: "pr_tln_4k_HP400",       key: 'pr_tln_4k_HP400__',      max_capacity:false },        //pr-tln-4k-HP400
        {ip: "192.168.67.3",    color: false,  name: 'pr_tln_4k_HP_P3005',    key: 'pr_tln_4k_HP_P3005__',   max_capacity: true},        //pr-tln-4k-HP_P3005
        {ip: "192.168.66.11",   color: false,  name: 'pr_tln_4k_HP521dn',     key: 'pr_tln_4k_HP521dn__',    max_capacity:false},        //pr-tln-4k-HP521dn
        {ip: "192.168.66.187",  color: true,   name: 'pr_tln_3k_HP476dn',     key: 'pr_tln_3k_HP476dn__',    max_capacity: false},        //pr-tln-3k-HP476dn
        //{ip:"192.168.71.10",  color: false,  name:'pr-tln-k3-k2-HPM605',    key:'pr_tln_3k_2k_HPM605__',   max_capacity: ? },        //pr-tln-k3-k2-HPM605 different network
        {ip: "192.168.81.10",   color: true,   name: 'pr_tln_2k_HPPro8610',   key: 'pr_tln_2k_HPPro8610__',  max_capacity:true},        //pr-tln-2k-HPPro8610
        {ip: "192.168.152.57",  color: false,  name: 'pr_tln_2k_HP1320n',     key: 'pr_tln_2k_HP1320n__',    max_capacity:true},        //pr-tln-2k-HP1320n
        {ip: "192.168.66.28",   color: false,  name: 'pr_tln_1k_HP255dn',     key: 'pr_tln_1k_HP255dn__',    max_capacity:false},        //pr-tln-1k-HP255dn
    ];
    let oidsArray = {
        pr_name:["1.3.6.1.2.1.1.5.0"],
        bw:["1.3.6.1.2.1.43.11.1.1.6.1.1",        //black name
            "1.3.6.1.2.1.43.11.1.1.9.1.1"],       //black cartridge
        colors:{cyan_name: "1.3.6.1.2.1.43.11.1.1.6.1.2",     //cyan name
            cyan: "1.3.6.1.2.1.43.11.1.1.9.1.2",     //cyan cartridge
            magenta_name: "1.3.6.1.2.1.43.11.1.1.6.1.3",     //magenta name
            magenta: "1.3.6.1.2.1.43.11.1.1.9.1.3",     //magenta cartridge
            yellow_name: "1.3.6.1.2.1.43.11.1.1.6.1.4",     //yellow name
            yellow: "1.3.6.1.2.1.43.11.1.1.9.1.4"},     //yellow cartridge
        max_capacity_bw:["1.3.6.1.2.1.43.11.1.1.8.1.1"],
        max_capacity_color:[ "1.3.6.1.2.1.43.11.1.1.8.1.2",
            "1.3.6.1.2.1.43.11.1.1.8.1.3",
            "1.3.6.1.2.1.43.11.1.1.8.1.4"
        ]
    };

    Object.keys(oidsArray.colors).map(function(key) {
        colorArray.push(oidsArray.colors[key]);
    });
};