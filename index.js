const express = require('express');
const connectDB = require('./connection');
const msApi = require('./schema');
const axios = require('axios');

const app = express();
app.use(express.json());

const accessToken = process.env.MICROSOFT_API_TOKEN;
console.log(accessToken);

const a = `https://graph.microsoft.com/v1.0/teams/${process.env.TEAM_ID}/channels/${process.env.CHANNEL_ID}/messages?$expand=replies`;
console.log(a);

const config = {
    headers: {
        Authorization: `Bearer ${accessToken}`,
    },
};


const fetchData = async (url, config) => {
    try {
      const response = await axios.get(url, config);
      const result = response.data.value.map((item) => item);
      const nextLink = response.data['@odata.nextLink'];
  
      if (nextLink) {
        const nextResult = await fetchData(nextLink, config);
        return [...result, ...nextResult];
      }
  
      return result;
    } catch (error) {
      console.error('Error in fetchData:', error);
      throw new Error('Failed to fetch data');
    }
  };

app.post('/api/result', async (req, res) => {
    try {
      await connectDB();
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const result = await fetchData(`https://graph.microsoft.com/v1.0/teams/${TEAM_ID}/channels/${CHANNEL_ID}/messages?$expand=replies`, config);
      const data = result.map((item) => ({
        user: item.from?.user?.displayName,
        message: item.body?.content,
        lastTimeModification: item.lastModifiedDateTime,
        replies: item.replies?.map((reply) => ({
          user: reply.from?.user?.displayName,
          message: reply.body?.content,
          lastTimeReplyModification: reply.lastModifiedDateTime,
        })),
      }));
  
      const newResult = new msApi({ Result: data });
      await newResult.save();
  
      res.status(201).json({ newResult });
    } catch (error) {
      console.error('Error in route handler:', error);
      res.status(500).json({ message: 'Failed to process request' });
    }
  });


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));