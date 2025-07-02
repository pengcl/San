/**
 * 通过API为测试账号创建初始武将
 */

const axios = require('axios');

const API_URL = 'http://localhost:1337/api';
const USERNAME = 'pengcl';
const PASSWORD = 'zouleyuan';

async function createInitialHeroes() {
  try {
    console.log('1. 登录获取token...');
    
    // 登录获取token
    const loginResponse = await axios.post(`${API_URL}/auth/local`, {
      identifier: USERNAME,
      password: PASSWORD
    });
    
    const { jwt, user } = loginResponse.data;
    console.log(`登录成功! 用户: ${user.username} (ID: ${user.id})`);
    
    // 解码JWT查看内容
    const jwtPayload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString());
    console.log('JWT内容:', jwtPayload);
    
    // 设置请求头
    const config = {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      }
    };
    
    // 定义要创建的武将
    const heroesToCreate = [
      { hero_id: 1001, level: 10, star: 2, name: '刘备' },
      { hero_id: 1003, level: 8, star: 2, name: '关羽' },
      { hero_id: 1004, level: 5, star: 1, name: '张飞' }
    ];
    
    console.log('\n2. 开始创建武将...');
    
    for (const heroData of heroesToCreate) {
      try {
        console.log(`\n创建武将: ${heroData.name}`);
        
        const response = await axios.post(`${API_URL}/user-heroes`, {
          hero_id: heroData.hero_id,
          level: heroData.level,
          star: heroData.star
        }, config);
        
        console.log(`✅ 成功创建: ${heroData.name} (等级: ${heroData.level}, 星级: ${heroData.star}, 战力: ${response.data.data.power})`);
      } catch (error) {
        if (error.response && error.response.data) {
          console.error(`❌ 创建失败: ${heroData.name} - ${error.response.data.error?.message || error.response.data.message}`);
        } else {
          console.error(`❌ 创建失败: ${heroData.name} - ${error.message}`);
        }
      }
    }
    
    console.log('\n3. 查询用户当前拥有的武将...');
    
    // 获取用户武将列表
    const heroesResponse = await axios.get(`${API_URL}/user-heroes`, config);
    const heroes = heroesResponse.data.data;
    
    console.log(`\n用户当前拥有 ${heroes.length} 个武将:`);
    heroes.forEach((hero, index) => {
      console.log(`${index + 1}. ${hero.name} - 等级: ${hero.level}, 星级: ${hero.star}, 战力: ${hero.power}`);
    });
    
    console.log('\n✅ 初始武将分配完成!');
    
  } catch (error) {
    console.error('\n错误:', error.message);
    if (error.response && error.response.data) {
      console.error('详细错误:', error.response.data);
    }
  }
}

// 执行脚本
createInitialHeroes();